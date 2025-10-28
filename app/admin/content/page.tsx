'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Review,
  SocialPost,
  FlaggedContent,
  QualityRule,
  AutoFilter,
  ModerationStats,
  ModerationActivity,
  getAllReviews,
  approveReview,
  rejectReview,
  getAllPosts,
  removePost,
  approvePost,
  getAllFlags,
  resolveFlag,
  dismissFlag,
  getAllQualityRules,
  toggleQualityRule,
  getAllAutoFilters,
  toggleAutoFilter,
  getModerationStats,
  getRecentActivities,
} from '@/lib/admin-content-service';

export default function ContentModerationPage() {
  const [activeTab, setActiveTab] = useState<
    'reviews' | 'posts' | 'flags' | 'quality' | 'filters' | 'analytics'
  >('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [flags, setFlags] = useState<FlaggedContent[]>([]);
  const [qualityRules, setQualityRules] = useState<QualityRule[]>([]);
  const [autoFilters, setAutoFilters] = useState<AutoFilter[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [activities, setActivities] = useState<ModerationActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [reviewFilter, setReviewFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected' | 'flagged'
  >('all');
  const [postFilter, setPostFilter] = useState<'all' | 'active' | 'hidden' | 'removed'>('all');
  const [flagFilter, setFlagFilter] = useState<
    'all' | 'pending' | 'investigating' | 'resolved' | 'dismissed'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<FlaggedContent | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        reviewsData,
        postsData,
        flagsData,
        rulesData,
        filtersData,
        statsData,
        activitiesData,
      ] = await Promise.all([
        getAllReviews(),
        getAllPosts(),
        getAllFlags(),
        getAllQualityRules(),
        getAllAutoFilters(),
        getModerationStats(),
        getRecentActivities(20),
      ]);
      setReviews(reviewsData);
      setPosts(postsData);
      setFlags(flagsData);
      setQualityRules(rulesData);
      setAutoFilters(filtersData);
      setStats(statsData);
      setActivities(activitiesData);
    } catch (error) {
      toast.error('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  // Review handlers
  const handleApproveReview = async (reviewId: string, notes?: string) => {
    try {
      await approveReview(reviewId, notes);
      toast.success('Review approved successfully');
      loadAllData();
      setShowReviewModal(false);
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleRejectReview = async (reviewId: string, notes: string) => {
    try {
      await rejectReview(reviewId, notes);
      toast.success('Review rejected successfully');
      loadAllData();
      setShowReviewModal(false);
    } catch (error) {
      toast.error('Failed to reject review');
    }
  };

  // Post handlers
  const handleApprovePost = async (postId: string, notes?: string) => {
    try {
      await approvePost(postId, notes);
      toast.success('Post approved successfully');
      loadAllData();
      setShowPostModal(false);
    } catch (error) {
      toast.error('Failed to approve post');
    }
  };

  const handleRemovePost = async (postId: string, notes: string) => {
    try {
      await removePost(postId, notes);
      toast.success('Post removed successfully');
      loadAllData();
      setShowPostModal(false);
    } catch (error) {
      toast.error('Failed to remove post');
    }
  };

  // Flag handlers
  const handleResolveFlag = async (flagId: string, resolution: string, actionTaken: string) => {
    try {
      await resolveFlag(flagId, resolution, actionTaken);
      toast.success('Flag resolved successfully');
      loadAllData();
      setShowFlagModal(false);
    } catch (error) {
      toast.error('Failed to resolve flag');
    }
  };

  const handleDismissFlag = async (flagId: string, reason: string) => {
    try {
      await dismissFlag(flagId, reason);
      toast.success('Flag dismissed successfully');
      loadAllData();
      setShowFlagModal(false);
    } catch (error) {
      toast.error('Failed to dismiss flag');
    }
  };

  // Quality rule handlers
  const handleToggleQualityRule = async (ruleId: string, enabled: boolean) => {
    try {
      await toggleQualityRule(ruleId, enabled);
      toast.success(`Quality rule ${enabled ? 'enabled' : 'disabled'}`);
      loadAllData();
    } catch (error) {
      toast.error('Failed to update quality rule');
    }
  };

  // Auto filter handlers
  const handleToggleAutoFilter = async (filterId: string, enabled: boolean) => {
    try {
      await toggleAutoFilter(filterId, enabled);
      toast.success(`Auto filter ${enabled ? 'enabled' : 'disabled'}`);
      loadAllData();
    } catch (error) {
      toast.error('Failed to update auto filter');
    }
  };

  // Filtered data
  const filteredReviews = reviews.filter(review => {
    const matchesFilter = reviewFilter === 'all' || review.status === reviewFilter;
    const matchesSearch =
      searchTerm === '' ||
      review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredPosts = posts.filter(post => {
    const matchesFilter = postFilter === 'all' || post.status === postFilter;
    const matchesSearch =
      searchTerm === '' ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.userName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredFlags = flags.filter(flag => {
    const matchesFilter = flagFilter === 'all' || flag.status === flagFilter;
    const matchesSearch =
      searchTerm === '' ||
      flag.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
        <p className="text-gray-600 mt-1">
          Review and moderate user-generated content across the platform
        </p>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pendingReviews}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.approvedReviews} approved, {stats.rejectedReviews} rejected
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Posts</p>
                <p className="text-3xl font-bold text-green-600">{stats.activePosts}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.removedPosts} removed</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Flags</p>
                <p className="text-3xl font-bold text-red-600">{stats.pendingFlags}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.resolvedFlags} resolved, {stats.dismissedFlags} dismissed
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Resolution Time</p>
                <p className="text-3xl font-bold text-blue-600">{stats.avgResolutionTime}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <button
                onClick={() => setShowAnalyticsModal(true)}
                className="text-blue-600 hover:underline"
              >
                View detailed analytics
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Social Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('flags')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'flags'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Flagged Content ({flags.length})
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'quality'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quality Rules ({qualityRules.length})
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'filters'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Auto Filters ({autoFilters.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            {activeTab === 'reviews' && (
              <select
                value={reviewFilter}
                onChange={e =>
                  setReviewFilter(
                    e.target.value as 'all' | 'pending' | 'approved' | 'rejected' | 'flagged'
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="flagged">Flagged</option>
              </select>
            )}
            {activeTab === 'posts' && (
              <select
                value={postFilter}
                onChange={e => setPostFilter(e.target.value as 'all' | 'active' | 'hidden' | 'removed')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Posts</option>
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
                <option value="removed">Removed</option>
              </select>
            )}
            {activeTab === 'flags' && (
              <select
                value={flagFilter}
                onChange={e =>
                  setFlagFilter(
                    e.target.value as 'all' | 'pending' | 'investigating' | 'resolved' | 'dismissed'
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Flags</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No reviews found</p>
              ) : (
                filteredReviews.map(review => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-600">
                              {review.userName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{review.userName}</h3>
                            <span className="text-gray-500 text-sm">•</span>
                            <span className="text-sm text-gray-500">{review.restaurantName}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'
                                  }`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 mt-2">{review.content}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleString()}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                review.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : review.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : review.status === 'flagged'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {review.status}
                            </span>
                            {review.flagCount > 0 && (
                              <span className="text-xs text-red-600">
                                🚩 {review.flagCount} flag{review.flagCount > 1 ? 's' : ''}
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              👍 {review.helpful} 👎 {review.notHelpful}
                            </span>
                          </div>
                          {review.flagReasons.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-red-600">
                                Flags: {review.flagReasons.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowReviewModal(true);
                        }}
                        className="ml-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No posts found</p>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-600">
                              {post.userName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{post.userName}</h3>
                            <span className="text-sm text-gray-500">
                              {new Date(post.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-2">{post.content}</p>
                          {post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {post.hashtags.map((tag, i) => (
                                <span key={i} className="text-sm text-amber-600">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                post.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : post.status === 'hidden'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {post.status}
                            </span>
                            {post.flagCount > 0 && (
                              <span className="text-xs text-red-600">
                                🚩 {post.flagCount} flag{post.flagCount > 1 ? 's' : ''}
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              ❤️ {post.likes} 💬 {post.comments} 🔄 {post.shares}
                            </span>
                          </div>
                          {post.flagReasons.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-red-600">
                                Flags: {post.flagReasons.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowPostModal(true);
                        }}
                        className="ml-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        Moderate
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Flags Tab */}
          {activeTab === 'flags' && (
            <div className="space-y-4">
              {filteredFlags.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No flagged content found</p>
              ) : (
                filteredFlags.map(flag => (
                  <div key={flag.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              flag.severity === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : flag.severity === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : flag.severity === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {flag.severity}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {flag.category}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              flag.status === 'resolved'
                                ? 'bg-green-100 text-green-800'
                                : flag.status === 'dismissed'
                                ? 'bg-gray-100 text-gray-800'
                                : flag.status === 'investigating'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {flag.status}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mt-2">{flag.reason}</h3>
                        <p className="text-gray-600 text-sm mt-1">{flag.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span>
                            Reported by: <strong>{flag.reporterName}</strong>
                          </span>
                          <span>•</span>
                          <span>{new Date(flag.createdAt).toLocaleString()}</span>
                          <span>•</span>
                          <span>
                            {flag.contentType}: {flag.contentId}
                          </span>
                        </div>
                        {flag.resolution && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-semibold text-gray-700">Resolution:</p>
                            <p className="text-sm text-gray-600 mt-1">{flag.resolution}</p>
                            {flag.actionTaken && (
                              <p className="text-sm text-gray-600 mt-1">
                                Action: {flag.actionTaken}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {flag.status === 'pending' || flag.status === 'investigating' ? (
                        <button
                          onClick={() => {
                            setSelectedFlag(flag);
                            setShowFlagModal(true);
                          }}
                          className="ml-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                          Handle
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Quality Rules Tab */}
          {activeTab === 'quality' && (
            <div className="space-y-4">
              {qualityRules.map(rule => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            rule.severity === 'block'
                              ? 'bg-red-100 text-red-800'
                              : rule.severity === 'flag'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rule.severity}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {rule.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">{rule.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>Action: {rule.action.replace(/_/g, ' ')}</span>
                        <span>•</span>
                        <span>Violations: {rule.violationCount}</span>
                        {rule.lastTriggered && (
                          <>
                            <span>•</span>
                            <span>Last: {new Date(rule.lastTriggered).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleToggleQualityRule(rule.id, !rule.enabled)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          rule.enabled
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Auto Filters Tab */}
          {activeTab === 'filters' && (
            <div className="space-y-4">
              {autoFilters.map(filter => (
                <div key={filter.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{filter.name}</h3>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {filter.type}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            filter.action === 'reject'
                              ? 'bg-red-100 text-red-800'
                              : filter.action === 'flag'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {filter.action}
                        </span>
                      </div>
                      {filter.keywords && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Keywords:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {filter.keywords.slice(0, 5).map((keyword, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {keyword}
                              </span>
                            ))}
                            {filter.keywords.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                +{filter.keywords.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {filter.pattern && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Pattern:</p>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {filter.pattern}
                          </code>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>Applies to: {filter.appliesTo.join(', ')}</span>
                        <span>•</span>
                        <span>Matches: {filter.matchCount}</span>
                        {filter.lastMatched && (
                          <>
                            <span>•</span>
                            <span>Last: {new Date(filter.lastMatched).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleToggleAutoFilter(filter.id, !filter.enabled)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          filter.enabled
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {filter.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && stats && (
            <div className="space-y-6">
              {/* Moderator Performance */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Moderator Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.moderatorPerformance.map(mod => (
                    <div key={mod.moderatorId} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">{mod.moderatorName}</h4>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Actions Count:</span>
                          <span className="font-semibold">{mod.actionsCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Avg Response Time:</span>
                          <span className="font-semibold">{mod.avgResponseTime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Accuracy:</span>
                          <span className="font-semibold text-green-600">{mod.accuracy}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content by Category */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content by Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.contentByCategory.map(cat => (
                    <div key={cat.category} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">{cat.category}</h4>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-semibold">{cat.count}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Flagged:</span>
                          <span className="font-semibold text-red-600">{cat.flaggedCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Flag Rate:</span>
                          <span className="font-semibold">
                            {((cat.flaggedCount / cat.count) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="border border-gray-200 rounded-lg divide-y">
                  {activities.slice(0, 10).map(activity => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            activity.type === 'review'
                              ? 'bg-amber-100 text-amber-800'
                              : activity.type === 'post'
                              ? 'bg-green-100 text-green-800'
                              : activity.type === 'flag'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {activity.type}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {activity.action}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{activity.performerName}</span>
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedReview && (
        <ReviewModal
          review={selectedReview}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedReview(null);
          }}
          onApprove={handleApproveReview}
          onReject={handleRejectReview}
        />
      )}

      {/* Post Modal */}
      {showPostModal && selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => {
            setShowPostModal(false);
            setSelectedPost(null);
          }}
          onApprove={handleApprovePost}
          onRemove={handleRemovePost}
        />
      )}

      {/* Flag Modal */}
      {showFlagModal && selectedFlag && (
        <FlagModal
          flag={selectedFlag}
          onClose={() => {
            setShowFlagModal(false);
            setSelectedFlag(null);
          }}
          onResolve={handleResolveFlag}
          onDismiss={handleDismissFlag}
        />
      )}
    </div>
  );
}

// Review Modal Component
function ReviewModal({
  review,
  onClose,
  onApprove,
  onReject,
}: {
  review: Review;
  onClose: () => void;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes: string) => void;
}) {
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(review.id, notes || undefined);
    } else if (action === 'reject') {
      if (!notes.trim()) {
        toast.error('Please provide a reason for rejection');
        return;
      }
      onReject(review.id, notes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Moderation</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Review ID</p>
              <p className="font-semibold">{review.id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">User</p>
              <p className="font-semibold">{review.userName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Restaurant</p>
              <p className="font-semibold">{review.restaurantName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Content</p>
              <p className="mt-1 p-3 bg-gray-50 rounded">{review.content}</p>
            </div>

            {review.flagCount > 0 && (
              <div>
                <p className="text-sm text-gray-600">Flags ({review.flagCount})</p>
                <div className="mt-1 p-3 bg-red-50 rounded">
                  <p className="text-sm text-red-600">{review.flagReasons.join(', ')}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Engagement</p>
              <p className="text-sm">
                👍 {review.helpful} helpful, 👎 {review.notHelpful} not helpful
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Moderator Notes</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                rows={3}
                placeholder="Add moderation notes..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setAction('approve');
                handleSubmit();
              }}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Approve Review
            </button>
            <button
              onClick={() => {
                setAction('reject');
                handleSubmit();
              }}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Reject Review
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Post Modal Component
function PostModal({
  post,
  onClose,
  onApprove,
  onRemove,
}: {
  post: SocialPost;
  onClose: () => void;
  onApprove: (id: string, notes?: string) => void;
  onRemove: (id: string, notes: string) => void;
}) {
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'remove' | null>(null);

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(post.id, notes || undefined);
    } else if (action === 'remove') {
      if (!notes.trim()) {
        toast.error('Please provide a reason for removal');
        return;
      }
      onRemove(post.id, notes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Moderation</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Post ID</p>
              <p className="font-semibold">{post.id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">User</p>
              <p className="font-semibold">{post.userName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Content</p>
              <p className="mt-1 p-3 bg-gray-50 rounded">{post.content}</p>
            </div>

            {post.hashtags.length > 0 && (
              <div>
                <p className="text-sm text-gray-600">Hashtags</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {post.hashtags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-amber-100 text-amber-800 text-sm rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {post.flagCount > 0 && (
              <div>
                <p className="text-sm text-gray-600">Flags ({post.flagCount})</p>
                <div className="mt-1 p-3 bg-red-50 rounded">
                  <p className="text-sm text-red-600">{post.flagReasons.join(', ')}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Engagement</p>
              <p className="text-sm">
                ❤️ {post.likes} likes, 💬 {post.comments} comments, 🔄 {post.shares} shares
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Moderator Notes</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                rows={3}
                placeholder="Add moderation notes..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setAction('approve');
                handleSubmit();
              }}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Approve Post
            </button>
            <button
              onClick={() => {
                setAction('remove');
                handleSubmit();
              }}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Remove Post
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Flag Modal Component
function FlagModal({
  flag,
  onClose,
  onResolve,
  onDismiss,
}: {
  flag: FlaggedContent;
  onClose: () => void;
  onResolve: (id: string, resolution: string, actionTaken: string) => void;
  onDismiss: (id: string, reason: string) => void;
}) {
  const [resolution, setResolution] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [action, setAction] = useState<'resolve' | 'dismiss' | null>(null);

  const handleSubmit = () => {
    if (action === 'resolve') {
      if (!resolution.trim() || !actionTaken.trim()) {
        toast.error('Please provide resolution details and action taken');
        return;
      }
      onResolve(flag.id, resolution, actionTaken);
    } else if (action === 'dismiss') {
      if (!resolution.trim()) {
        toast.error('Please provide a reason for dismissal');
        return;
      }
      onDismiss(flag.id, resolution);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Handle Flagged Content</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Flag ID</p>
              <p className="font-semibold">{flag.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Severity</p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    flag.severity === 'critical'
                      ? 'bg-red-100 text-red-800'
                      : flag.severity === 'high'
                      ? 'bg-orange-100 text-orange-800'
                      : flag.severity === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {flag.severity}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  {flag.category}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Reported By</p>
              <p className="font-semibold">{flag.reporterName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Content Type</p>
              <p>
                {flag.contentType} (ID: {flag.contentId})
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Reason</p>
              <p className="font-semibold">{flag.reason}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="mt-1 p-3 bg-gray-50 rounded">{flag.description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Resolution / Reason</p>
              <textarea
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                rows={3}
                placeholder="Describe the resolution or dismissal reason..."
              />
            </div>

            {action === 'resolve' && (
              <div>
                <p className="text-sm text-gray-600">Action Taken</p>
                <textarea
                  value={actionTaken}
                  onChange={e => setActionTaken(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={2}
                  placeholder="What action was taken to resolve this flag?"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setAction('resolve');
                handleSubmit();
              }}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Resolve Flag
            </button>
            <button
              onClick={() => {
                setAction('dismiss');
                handleSubmit();
              }}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Dismiss Flag
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
